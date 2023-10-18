import "../css/2049.css"

export const Tile = ({ value }) => {
    return (
        <div className={`tile ${value !== null ? `tile-${value}` : ''}`}>
        <div className="tile_number">{value}</div>
    </div>
    )
}