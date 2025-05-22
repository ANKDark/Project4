import React from 'react';
import { Link } from '@inertiajs/react';

export default function ListBox({ table, keyword, valueName }) {
  const filtered = table.filter(t =>
    t[valueName].toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="list-group list-unv-search">
      {filtered.map((t, index) => (
        <Link
          key={index}
          href={`details/${t.Id}`}
          className="list-group-item list-group-item-action list-group-item-dark"
        >
          {t[valueName]}
        </Link>
      ))}
    </div>
  );
}
