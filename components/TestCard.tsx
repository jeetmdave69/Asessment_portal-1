import React from 'react';

export default function TestCard() {
  return (
    <div className="card card-pad">
      <h2 className="title text-xl mb-2">Test Card</h2>
      <p className="muted mb-4">This card demonstrates the new utility classes.</p>
      <div className="space-x-3">
        <button className="btn-primary">Primary Button</button>
        <button className="btn-secondary">Secondary Button</button>
        <button className="btn-neutral">Neutral Button</button>
      </div>
    </div>
  );
}
