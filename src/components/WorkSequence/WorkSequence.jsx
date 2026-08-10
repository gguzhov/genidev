import "./WorkSequence.css";

export default function WorkSequence({ items, reducedMotion = false }) {
  return (
    <div className={`work-sequence${reducedMotion ? " work-sequence--static" : ""}`}>
      <svg className="work-sequence__track" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
        <path className="work-sequence__track-base" pathLength="1" d="M2 5 H98" />
        <path className="work-sequence__track-signal" pathLength="1" d="M2 5 H98" />
      </svg>
      <ol aria-label="Этапы комплексной работы">
        {items.map((item, index) => (
          <li
            className="work-sequence__item"
            key={item}
            style={{ "--sequence-index": index }}
          >
            <span className="work-sequence__marker" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="work-sequence__label">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
