import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import useReducedMotion from "../../hooks/useReducedMotion";
import { applyProfileTilt, resetProfileTilt } from "./profileCardMotion";
import "./ProfileCard.css";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function ProfileCardComponent({
  avatarUrl,
  name,
  onContactClick,
  enableTilt = true,
}) {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const wrapperRef = useRef(null);
  const frameRef = useRef(null);
  const animationFrameRef = useRef(null);
  const boundsRef = useRef(null);
  const boundsDirtyRef = useRef(true);
  const latestPointerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const tiltEnabled = enableTilt && hasFinePointer && !reducedMotion;

  useEffect(() => {
    const media = window.matchMedia(FINE_POINTER_QUERY);
    const updatePointer = () => setHasFinePointer(media.matches);

    updatePointer();
    media.addEventListener("change", updatePointer);
    return () => media.removeEventListener("change", updatePointer);
  }, []);

  useEffect(() => {
    if (tiltEnabled) return undefined;

    animationFrameRef.current = resetProfileTilt(
      wrapperRef.current,
      animationFrameRef.current,
      window.cancelAnimationFrame,
    );
    return undefined;
  }, [tiltEnabled]);

  const cacheBounds = useCallback(() => {
    boundsRef.current = frameRef.current?.getBoundingClientRect() ?? null;
    boundsDirtyRef.current = false;
  }, []);

  const invalidateBounds = useCallback(() => {
    boundsDirtyRef.current = true;
  }, []);

  useEffect(() => {
    if (!tiltEnabled) return undefined;

    cacheBounds();
    window.addEventListener("resize", cacheBounds);
    window.addEventListener("scroll", invalidateBounds, { passive: true });
    return () => {
      window.removeEventListener("resize", cacheBounds);
      window.removeEventListener("scroll", invalidateBounds);
    };
  }, [cacheBounds, invalidateBounds, tiltEnabled]);

  useEffect(
    () => () => {
      animationFrameRef.current = resetProfileTilt(
        wrapperRef.current,
        animationFrameRef.current,
        window.cancelAnimationFrame,
      );
    },
    [],
  );

  const handlePointerEnter = useCallback(() => {
    if (!tiltEnabled) return;
    cacheBounds();
  }, [cacheBounds, tiltEnabled]);

  const handlePointerMove = useCallback(
    (event) => {
      if (!tiltEnabled) return;
      latestPointerRef.current = { clientX: event.clientX, clientY: event.clientY };
      if (animationFrameRef.current != null) return;

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        if (boundsDirtyRef.current) cacheBounds();
        const bounds = boundsRef.current;
        const pointer = latestPointerRef.current;
        const wrapper = wrapperRef.current;
        if (!bounds || !pointer || !wrapper || bounds.width === 0 || bounds.height === 0) return;

        const x = ((pointer.clientX - bounds.left) / bounds.width) * 100;
        const y = ((pointer.clientY - bounds.top) / bounds.height) * 100;
        applyProfileTilt(wrapper, x, y);
      });
    },
    [cacheBounds, tiltEnabled],
  );

  const handlePointerLeave = useCallback(() => {
    if (!tiltEnabled) return;
    latestPointerRef.current = null;
    animationFrameRef.current = resetProfileTilt(
      wrapperRef.current,
      animationFrameRef.current,
      window.cancelAnimationFrame,
    );
  }, [tiltEnabled]);

  return (
    <div
      ref={wrapperRef}
      className={`profile-card-wrapper${tiltEnabled ? " profile-card-wrapper--tilt" : ""}`}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <article ref={frameRef} className="profile-card" aria-label={`Профиль ${name}`}>
        <div className="profile-card__markers" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <img
          className="profile-card__avatar"
          src={avatarUrl}
          alt={name}
          width="928"
          height="1152"
          loading="eager"
          fetchPriority="high"
        />
        <div className="profile-card__action-layer">
          <button
            className="profile-card__contact"
            type="button"
            aria-label={`Связаться с ${name}`}
            onClick={onContactClick}
          >
            Связаться
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </article>
    </div>
  );
}

const ProfileCard = memo(ProfileCardComponent);
export default ProfileCard;
