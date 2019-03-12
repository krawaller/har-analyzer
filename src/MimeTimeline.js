import { h } from 'preact';
import formatSeconds from './lib/format-seconds';

const MimeTimeline = ({ endTime, mimeEntries, startTime }) => {
  const totalTime = endTime - startTime;
  return (
    <div style={{ width: '100%' }}>
      <h2>MIME timeline</h2>

      <div
        style={{
          height: '20px',
          position: 'relative',
        }}
      >
      {Array.from(new Array(Math.round((endTime-startTime)/5000)))
          .map((_b, i) => i * 5)
          .map((n) => (
            <div
              style={{
                left: `${n*1000*100/totalTime}%`,
                position: 'absolute',
              }}
            >{n} s</div>
          ))}
      </div>

      {mimeEntries
        .map(entry => ({
          ...entry,
          relStartTime: entry.startTime - startTime,
          relEndTime: entry.endTime - startTime,
        }))
        .map(entry => (
        <div
          className={`bg-${entry.color}`}
          style={{
            left: `${(entry.relStartTime)*100/totalTime}%`,
            height: '20px',
            position: 'relative',
            whiteSpace: 'nowrap',
            width: `${(entry.relEndTime-entry.relStartTime)*100/totalTime}%`,
          }}
          title={`${formatSeconds(entry.relStartTime)} - ${formatSeconds(entry.relEndTime)}`}
        >
          {entry.mimeType} from {entry.initiatorType}
        </div>
      ))}
    </div>
  )
};

export default MimeTimeline;
