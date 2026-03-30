export default function LoadingSpinner({
  label = 'Loading',
  size = 'md',
  inline = false,
}) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';

  return (
    <span className={`loading-spinner-wrap ${inline ? 'inline' : ''}`} role="status" aria-live="polite" aria-label={label}>
      <span className={`loading-spinner ${sizeClass}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
