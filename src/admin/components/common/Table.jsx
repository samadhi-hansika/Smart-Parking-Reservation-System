import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react";

export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no matching items to display at this time.",
  emptyAction,
  searchable = false,
  searchPlaceholder = "Search records...",
  searchKeys = [],
  initialSortKey = null,
  initialSortDirection = "asc",
  pageSize = 10,
  rowKey = "id",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Search Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();

    return data.filter((row) => {
      // If specific search keys provided, only search in those
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = row[k];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(lower);
        });
      }
      // Otherwise search in all string/number fields of the row
      return Object.values(row).some((val) => {
        return val !== null && val !== undefined && String(val).toLowerCase().includes(lower);
      });
    });
  }, [data, searchTerm, searchKeys]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="admin-table-wrapper">
      {searchable && (
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="admin-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm("")}
              >
                &times;
              </button>
            )}
          </div>
          <span className="admin-table-count">
            Showing {sortedData.length} item{sortedData.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    style={{
                      width: col.width,
                      textAlign: col.align || "left",
                      cursor: col.sortable !== false ? "pointer" : "default",
                    }}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={col.sortable !== false ? "sortable-th" : ""}
                  >
                    <div
                      className={`th-content ${
                        col.align === "right"
                          ? "justify-end"
                          : col.align === "center"
                          ? "justify-center"
                          : "justify-start"
                      }`}
                    >
                      <span>{col.label}</span>
                      {col.sortable !== false && (
                        <span className="sort-icons">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ChevronUp size={14} className="active-sort" />
                            ) : (
                              <ChevronDown size={14} className="active-sort" />
                            )
                          ) : (
                            <ChevronDown size={14} className="idle-sort" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: Math.min(pageSize, 5) }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="skeleton-row">
                  {columns.map((col, cIdx) => (
                    <td key={`skel-cell-${cIdx}`}>
                      <div className="table-skeleton-cell"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  <div className="admin-empty-state">
                    <div className="empty-icon-wrap">
                      <Inbox size={36} />
                    </div>
                    <h4 className="empty-title">{emptyTitle}</h4>
                    <p className="empty-desc">{emptyDescription}</p>
                    {emptyAction && <div className="empty-action-wrap">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              paginatedData.map((row, idx) => {
                const keyVal = row[rowKey] ?? idx;
                return (
                  <tr key={keyVal} className="admin-table-row">
                    {columns.map((col) => (
                      <td
                        key={`${keyVal}-${col.key}`}
                        style={{ textAlign: col.align || "left" }}
                      >
                        {col.render ? col.render(row[col.key], row, idx) : row[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && sortedData.length > pageSize && (
        <div className="admin-pagination">
          <div className="pagination-info">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-pages">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
