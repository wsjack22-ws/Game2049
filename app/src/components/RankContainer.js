import RankEntry from "./RankEntry";
import "../css/App.css";

const RankContainer = ({ topUsers }) => {
    return (
      <div className='rank'>
        {topUsers.map((user) => (
          <RankEntry
            key={user.rank}
            rank={user.rank}
            name={user.name}
            score={user.score}
          />
        ))}
      </div>
    );
  };

export default RankContainer;