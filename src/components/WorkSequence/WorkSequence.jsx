import "./WorkSequence.css";

export default function WorkSequence({ items, reducedMotion = false }) {
  return (
    <ol
      className={`work-sequence${reducedMotion ? " work-sequence--static" : ""}`}
      aria-label="Этапы комплексной работы"
    >
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
  );
}
