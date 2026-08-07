import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import useReducedMotion from "../../hooks/useReducedMotion";
import "./ProfileCard.css";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function ProfileCardComponent({
  avatarUrl,
  name,
  title,
  handle,
  onContactClick,
  enableTilt = true,
}) {
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const wrapperRef = useRef(null);
  const frameRef = useRef(null);
  const animationFrameRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const tiltEnabled = enableTilt && hasFinePointer && !reducedMotion;

  useEffect(() => {
    const media = window.matchMedia(FINE_POINTER_QUERY);
    const updatePointer = () => setHasFinePointer(media.matches);

    updatePointer();
    media.addEventListener("change", updatePointer);
    return () => media.removeEventListener("change", updatePointer);
  }, []);

  useEffect(
    () => () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    },
    [],
  );

  const setPointerPosition = useCallback((x, y) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.style.setProperty("--pointer-x", `${x}%`);
    wrapper.style.setProperty("--pointer-y", `${y}%`);
    wrapper.style.setProperty("--rotate-x", `${(50 - y) / 9}deg`);
    wrapper.style.setProperty("--rotate-y", `${(x - 50) / 11}deg`);
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!tiltEnabled || !frameRef.current) return;
      const bounds = frameRef.current.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;

      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(() => setPointerPosition(x, y));
    },
    [setPointerPosition, tiltEnabled],
  );

  const handlePointerLeave = useCallback(() => {
    if (!tiltEnabled) return;
    setPointerPosition(50, 50);
  }, [setPointerPosition, tiltEnabled]);

  return (
    <div
      ref={wrapperRef}
      className={`profile-card-wrapper${tiltEnabled ? " profile-card-wrapper--tilt" : ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="profile-card__behind" aria-hidden="true" />
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
        <div className="profile-card__info">
          <div className="profile-card__identity">
            <p className="profile-card__handle">@{handle}</p>
            <h2>{name}</h2>
            <p className="profile-card__title">{title}</p>
          </div>
          <button className="profile-card__contact" type="button" onClick={onContactClick}>
            Решить проблему
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </div>
      </article>
    </div>
  );
}

const ProfileCard = memo(ProfileCardComponent);
export default ProfileCard;
