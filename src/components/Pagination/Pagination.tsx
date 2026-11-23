import './Pagination.css';

export function Pagination() {
  return (
    <div className="pagination" aria-hidden="true">
      <span className="pagination__dot pagination__dot--square" />
      <span className="pagination__dot pagination__dot--active" />
      <span className="pagination__dot" />
    </div>
  );
}
