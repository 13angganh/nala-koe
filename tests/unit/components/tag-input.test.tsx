import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from '@/components/tags/tag-input';

describe('TagInput — verifikasi apa yang sebenarnya dikirim ke onChange saat user mengetik', () => {
  it('mengetik tag baru lalu Enter — onChange dipanggil dengan array BERISI tag baru (bukan array kosong)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TagInput value={[]} onChange={onChange} />);

    const input = screen.getByLabelText('Ketik tag baru');
    await user.type(input, 'kerja');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(['kerja']);
  });

  it('menambah tag KEDUA ke value yang sudah berisi 1 tag — onChange membawa KEDUA tag, bukan cuma yang baru', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TagInput value={['kerja']} onChange={onChange} />);

    const input = screen.getByLabelText('Ketik tag baru');
    await user.type(input, 'penting');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(['kerja', 'penting']);
  });

  it('FIX: parent re-render lambat — mengetik tag KEDUA sebelum value prop ter-update, tag PERTAMA tetap ada (bukan stale closure)', async () => {
    // This is the actual root cause of the reported "tag tetap hilang, di
    // catatan lama maupun baru": addTag()/removeTag() used to read `value`
    // directly from this component's render closure. `value` is a
    // CONTROLLED prop coming from Zustand through several layers
    // (NoteEditor -> NoteMetaPanel, which is wrapped in React.memo — see
    // note-meta-panel.tsx) — there is a real gap between calling
    // onChange() and this component re-rendering with the updated
    // `value`. Typing two tags in quick succession (an entirely normal
    // thing to do) can land the second addTag() call inside that gap,
    // where it used to close over the STALE pre-update `value` and
    // silently overwrite the first tag. Confirmed failing before the
    // valueRef fix in tag-input.tsx, following this project's standing
    // tests-before-fix approach (see README.md v1.2.5/v1.2.6 changelog).
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} />);

    const user = userEvent.setup();
    const input = screen.getByLabelText('Ketik tag baru');

    await user.type(input, 'kerja');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenNthCalledWith(1, ['kerja']);

    // Deliberately NOT re-rendering with the updated value prop —
    // simulating a parent that hasn't committed the re-render yet,
    // exactly the gap the bug lived in.
    await user.type(input, 'penting');
    await user.keyboard('{Enter}');

    // Both tags must be present — valueRef.current tracks the true
    // current value across calls, independent of whether a re-render
    // happened between them.
    expect(onChange).toHaveBeenNthCalledWith(2, ['kerja', 'penting']);
  });

  it('FIX: removeTag juga pakai valueRef — tidak stale meski dipanggil beruntun sebelum re-render', async () => {
    const onChange = vi.fn();
    render(<TagInput value={['kerja', 'penting', 'urgent']} onChange={onChange} />);

    const removeButtons = screen.getAllByRole('button', { name: /hapus tag/i });
    // Remove two tags in immediate succession, same component instance,
    // no re-render in between — same class of gap as the addTag test above.
    await userEvent.setup().click(removeButtons[0]);
    await userEvent.click(removeButtons[1]);

    expect(onChange).toHaveBeenNthCalledWith(1, ['penting', 'urgent']);
    // If this second call were built from the original stale `value`
    // prop (['kerja', 'penting', 'urgent']) instead of valueRef.current
    // (already ['penting', 'urgent']), removing index 1 from the STALE
    // array would incorrectly resurrect 'kerja'.
    expect(onChange).toHaveBeenNthCalledWith(2, ['urgent']);
  });

  it('REGRESSION GUARD: value BENAR-BENAR berubah dari luar (pindah catatan) — valueRef harus ikut update, bukan keras kepala pertahankan array lama', async () => {
    // The opposite direction from the two fixes above: if this component
    // is reused for a different note (same TagInput instance, `value`
    // prop swapped to a completely different note's tags array), the fix
    // must not make valueRef stubbornly hang onto the OLD note's array.
    // This is what the useEffect([value]) dependency is specifically for
    // — distinguishing "value changed because a real external update
    // arrived" from "this component just re-rendered for some unrelated
    // internal reason".
    const onChange = vi.fn();
    const { rerender } = render(<TagInput value={['note-a-tag']} onChange={onChange} />);

    // Parent genuinely re-renders this component with a different note's
    // tags — e.g. the user navigated to a different note.
    rerender(<TagInput value={['note-b-tag']} onChange={onChange} />);

    const user = userEvent.setup();
    const input = screen.getByLabelText('Ketik tag baru');
    await user.type(input, 'baru');
    await user.keyboard('{Enter}');

    // Must build from note B's tags, not note A's stale array.
    expect(onChange).toHaveBeenCalledWith(['note-b-tag', 'baru']);
  });

  it('FIX: Backspace untuk hapus tag terakhir pakai valueRef, bukan `value` prop langsung — stale closure yang sama seperti addTag/removeTag, sempat terlewat dari fix sebelumnya', async () => {
    // addTag() and removeTag() were fixed to read valueRef.current instead
    // of the `value` prop directly (see the two FIX tests above). But
    // handleKeyDown's own Backspace-to-delete-last-tag branch —
    // `else if (e.key === 'Backspace' && !inputValue && value.length > 0)
    // { onChange(value.slice(0, -1)); }` — was never touched by that fix
    // and still reads `value` straight from this render's closure. Same
    // class of bug, same component, just a different code path than the
    // one the prior fix covered.
    //
    // Reproducing the exact gap the addTag fix targets: type a tag (this
    // component's own value prop is still the OLD array — deliberately
    // not rerendering, simulating the parent not having committed the
    // update yet), then immediately hit Backspace on an now-empty input
    // to delete that same tag. If Backspace reads the stale `value` prop
    // (which is `[]`, from before the tag was even added), `value.length
    // > 0` is false and the whole branch is skipped — Backspace silently
    // does nothing, which is at least safe. The more concerning case is
    // the one below: an existing tag already present in `value`, so
    // `value.length > 0` legitimately passes, but `value` itself may not
    // be the same array valueRef.current has already moved on from if
    // OTHER interactions (a suggestion click via addTag, for example)
    // updated valueRef.current in between without a re-render landing
    // yet — Backspace would then delete from the wrong (stale) array,
    // silently resurrecting or dropping the wrong tag.
    const onChange = vi.fn();
    render(<TagInput value={['kerja', 'penting']} onChange={onChange} />);

    const user = userEvent.setup();
    const input = screen.getByLabelText('Ketik tag baru');

    // Add a third tag via addTag (correctly uses valueRef.current, so
    // valueRef.current is now ['kerja', 'penting', 'urgent']) — but this
    // component's `value` PROP is still ['kerja', 'penting'], since we
    // deliberately don't rerender to simulate the parent not having
    // committed yet (identical setup to the "FIX: parent re-render
    // lambat" test above).
    await user.type(input, 'urgent');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenNthCalledWith(1, ['kerja', 'penting', 'urgent']);

    // Now Backspace on the empty input to delete the "last" tag. A
    // correct implementation deletes from the TRUE current array
    // (valueRef.current = ['kerja', 'penting', 'urgent']) → 'urgent' is
    // removed → ['kerja', 'penting']. Reading the stale `value` prop
    // instead builds from ['kerja', 'penting'] (what this render's
    // closure still thinks is current) → 'penting' is removed instead →
    // ['kerja'] — wrong tag deleted, and 'urgent' silently vanishes from
    // what's sent to onChange even though the user never asked to remove
    // it.
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenNthCalledWith(2, ['kerja', 'penting']);
  });
});
