export default function OutfitCard({ outfit }) {
  return (
    <div className="outfit-card">
      <h3>{outfit.name}</h3>

      <div className="outfit-items">
        {outfit.items.map(item => (
          <div key={item.id} className="outfit-item">
            <img src={item.imageUrl} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>

      {outfit.explanation && (
        <p className="outfit-explanation">
          {outfit.explanation}
        </p>
      )}

      {outfit.styleNotes && (
        <p className="outfit-notes">
          💡 {outfit.styleNotes}
        </p>
      )}
    </div>
  );
}
