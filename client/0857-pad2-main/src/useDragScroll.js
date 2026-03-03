import { useRef, useEffect } from "react";

function useDragScroll(ref) {
  const state = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // make sure it actually scrolls
    el.style.overflowX = "auto";
    el.style.cursor = "grab";
    el.style.userSelect = "none";

    const onPointerDown = (e) => {
      state.current.isDown = true;
      state.current.startX = e.clientX;
      state.current.scrollLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (!state.current.isDown) return;
      const dx = e.clientX - state.current.startX;
      el.scrollLeft = state.current.scrollLeft - dx;
    };
    const onPointerUpOrLeave = (e) => {
      state.current.isDown = false;
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUpOrLeave);
    el.addEventListener("pointerleave", onPointerUpOrLeave);
    el.addEventListener("pointercancel", onPointerUpOrLeave);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUpOrLeave);
      el.removeEventListener("pointerleave", onPointerUpOrLeave);
      el.addEventListener("pointercancel", onPointerUpOrLeave);
    };
  }, [ref]);
}
export default useDragScroll;
