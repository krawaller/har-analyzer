const dropHandler = target => {
  const dh = new EventTarget();

  target.addEventListener('dragover', event => {
    event.preventDefault();
  });

  target.addEventListener('drop', event => {
    event.preventDefault();

    const { files } = event.dataTransfer;

    [...files].forEach(file => {
      const reader = new FileReader();

      reader.addEventListener('load', e => {
        dh.dispatchEvent(new CustomEvent('fileLoaded', {
          detail: {
            file,
            content: e.target.result,
          }
        }));
      }, { once: true });

      reader.readAsText(file);
    });
  });

  return dh;
};

export default dropHandler;
