import { h, Component } from 'preact';
import MimeTimeline from './MimeTimeline';
import SecondsFormat from './SecondsFormat';

const colors = [
  'blue',
  'aqua',
  'teal',
  'olive',
  'green',
  'lime',
  'yellow',
  'orange',
  'red',
  'fuchsia',
  'purple',
  'maroon',
  'silver',
];

const getEntryPerMime = (harJson, excludedEntries) => Object.values(harJson.log.entries.reduce((acc, entry, index) => {
  if (excludedEntries.indexOf(index) > -1) return acc;

  const { mimeType } = entry.response.content;
  const initiatorType = entry._initiator.type;

  const key = mimeType+initiatorType;

  const mimeStats = acc[key] || {
    contentSize: 0,
    color: colors.find(c => !Object.keys(acc).find(mt => acc[mt].color === c)),
    count: 0,
    endTime: 0,
    startTime: new Date(entry.startedDateTime).getTime(),
  };

  return ({
    ...acc,
    [key]: {
      ...mimeStats,
      contentSize: mimeStats.contentSize + entry.response._transferSize,
      count: mimeStats.count + 1,
      endTime: Math.max(mimeStats.endTime, new Date(entry.startedDateTime).getTime() + entry.time),
      initiatorType,
      mimeType,
      startTime: Math.min(mimeStats.startTime, new Date(entry.startedDateTime).getTime()),
    }
  });
}, {}))
  .sort((a, b) => a.startTime < b.startTime ? -1 : 1);


export default class App extends Component {
  constructor(props) {
    super(props);

    this.handleToggleExclude = this.handleToggleExclude.bind(this);

    const entryPerMime = getEntryPerMime(this.props.harJson, []);

    this.setState({
      entryPerMime,
      excludedEntries: []
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.excludedEntries !== this.state.excludedEntries) {
      const entryPerMime = getEntryPerMime(this.props.harJson, this.state.excludedEntries);

      this.setState(() => ({
        entryPerMime,
      }));
    }
  }

  handleToggleExclude({ target }) {
    const index = +target.name;

    this.setState((state) => ({
      excludedEntries: state.excludedEntries.indexOf(index) === -1
        ? [...state.excludedEntries, index]
        : state.excludedEntries.filter((i) => i !== index)
    }));
  };

  render({ harJson }, { entryPerMime, excludedEntries }) {
    return (
      <div>
        <h1>HAR analyzer</h1>

        <ul>
          {harJson.log.pages.map(page => (
            <li>
              {page.title} timings:
              <ul>
                <li>
                  <a href="https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded">
                    onContentLoad
                  </a>:&nbsp;
                  <SecondsFormat time={page.pageTimings.onContentLoad} />
                </li>
                <li>onLoad: <SecondsFormat time={page.pageTimings.onLoad} /></li>
              </ul>
            </li>
          ))}
        </ul>

        <table style={{ width: '100%', marginBottom: '50px' }}>
          <thead>
            <tr>
              <th>MIME</th>
              <th>Initiator</th>
              <th>Amount</th>
              <th>Body size</th>
              <th>Start time</th>
              <th>End time</th>
            </tr>
          </thead>

          <tbody>
            {entryPerMime && entryPerMime
                .map(({ contentSize, color, count, endTime, initiatorType, mimeType, startTime }) => (
                <tr className={`bg-${color}`} key={mimeType+initiatorType}>
                  <td>{mimeType}</td>
                  <td>{initiatorType}</td>
                  <td>{count}</td>
                  <td>{contentSize / 1024} kb</td>
                  <td><SecondsFormat time={startTime - new Date(harJson.log.pages[0].startedDateTime).getTime() } /></td>
                  <td><SecondsFormat time={endTime - new Date(harJson.log.pages[0].startedDateTime).getTime() } /></td>
                </tr>
              ))}
          </tbody>
        </table>

        {entryPerMime && <MimeTimeline
          endTime={[...entryPerMime].sort((a, b) => a.endTime - b.endTime).pop().endTime}
          mimeEntries={entryPerMime}
          startTime={[...entryPerMime].shift().startTime}
        />}

      {entryPerMime && <table
        style={{
          tableLayout: 'fixed',
          width: '100vw',
          wordBreak: 'break-word',
        }}
      >
          <tbody>
            {harJson.log.entries.map((entry, index) => (
              <tr className={`bg-${(entryPerMime.find(e => e.mimeType === entry.response.content.mimeType) || {}).color}`}>
                <td>
                  <input
                    checked={excludedEntries.indexOf(index) === -1}
                    name={index}
                    onChange={this.handleToggleExclude}
                    type="checkbox"
                  />
                </td>
                <td><SecondsFormat time={entry.time} /></td>
                <td>{entry.response.content.mimeType}</td>
                <td>{entry._initiator.type}</td>
                <td>{entry.request.url}</td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    );
  }
}
