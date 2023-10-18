import "../css/App.css"
const RankEntry = (props) => {
    const {rank, name, score} = props;
    return (
        <div className='rank-entry'>
            <span className='rank-entry-text'>{rank}.</span>
            <span className='rank-entry-text'>{name}</span>
            <span className='rank-entry-text'>{score}  Points</span>
        </div>
    )
};

export default RankEntry;