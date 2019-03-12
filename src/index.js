import { h, render } from 'preact';
import App from './App';
import harJson from './har.json';

console.log((harJson.log.entries));

render(<App harJson={harJson} />, document.body);
