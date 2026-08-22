export default function FeedbackMessage({ tone = 'info', title, children }) {
  return (
    <div className={`feedback-message feedback-message--${tone}`} role="status">
      <span className="feedback-message__icon" aria-hidden="true">i</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
