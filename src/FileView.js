import { h } from "preact";

const colorMap = {
  "text/html other": "blue",
  "text/css parser": "aqua",
  "application/javascript parser": "teal",
  "image/svg+xml parser": "olive",
  "application/octet-stream parser": "green",
  "application/javascript script": "lime",
  "text/javascript script": "yellow",
  "application/json script": "orange",
  "image/gif script": "red",
  "text/plain script": "fuchsia",
  "image/x-icon other": "purple",
  "text/css script": "maroon"
};

const FileView = ({ harJson }) => {
  const beginning = +new Date(harJson.log.pages[0].startedDateTime);
  let entries = harJson.log.entries.map(entry => {
    const desc = (entry.response.content.text.match(
      /\.modules\.indexOf\("((\/[^\/\)]*){3})/
    ) || entry.request.url.match(/^https?:\/\/[^\/]*\/([^ ?]*)/))[1]
      .replace(/-/g, "‑")
      .replace(/[a-z0-9]{40}/, "GUID");
    const start = +new Date(entry.startedDateTime) - beginning;
    const size = `${Math.round(entry.response.content.size / 1000)}kb`;
    return {
      mimeType: entry.response.content.mimeType,
      desc,
      url: entry.request.url,
      size,
      start: start,
      end: start + Math.floor(entry.time),
      realEnd: +new Date(entry.startedDateTime) + entry.time,
      initiator: entry._initiator.type,
      content: entry.response.content.text,
      originalData: entry
    };
  });
  const end = entries.reduce(
    (mem, e) => (e.realEnd > mem ? e.realEnd : mem),
    0
  );
  const totalDuration = end - beginning;

  const rows = [[]];
  while (entries.length) {
    const toPlace = entries.shift();
    const rowIdx = rows.findIndex(
      row =>
        !row.some(
          e =>
            (e.start <= toPlace.start && e.end >= toPlace.start) ||
            (e.start <= toPlace.end && e.end >= toPlace.end)
        )
    );
    if (rowIdx === -1) {
      rows.push([toPlace]);
    } else {
      rows[rowIdx].push(toPlace);
    }
  }

  return (
    <div>
      <h4>Waterfall (click an entry to see details in log)</h4>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            width: "3px",
            backgroundColor: "red",
            top: 0,
            bottom: 0,
            left:
              (harJson.log.pages[0].pageTimings.onContentLoad / totalDuration) *
                100 +
              "%"
          }}
        />
        {rows.map(row => (
          <div
            style={{ position: "relative", height: "1em", marginBottom: "1px" }}
          >
            {row.map(entry => (
              <Entry entry={entry} totalDuration={totalDuration} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileView;

const Entry = ({ entry, totalDuration }) => {
  return (
    <div
      className="fileEntry"
      onClick={() =>
        console.log(
          entry.size,
          entry.mimeType,
          entry.desc,
          `\nStart ${entry.start / 1000}s - end ${entry.end / 1000}s`,
          entry
        )
      }
      style={{
        left: (entry.start / totalDuration) * 100 + "%",
        width: ((entry.end - entry.start) / totalDuration) * 100 + "%",
        backgroundColor:
          colorMap[entry.mimeType + " " + entry.initiator] || "silver"
      }}
      title={entry.desc}
    >
      {entry.desc}
    </div>
  );
};
