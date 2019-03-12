import { h } from 'preact';

const SecondsFormat = ({time}) => <span title={time}>{time / 1000} s</span>

export default SecondsFormat;
