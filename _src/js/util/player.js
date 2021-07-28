const progress = document.querySelectorAll('.player__range');

// todo Понять как это работает
for (let i = 0; i < progress.length; i++) {
  progress[i].addEventListener('input', function () {
    const value = this.value;
    this.style.background = `linear-gradient(to right, var(--basic-blue) 0%,
    var(--basic-blue) ${value}%, var(--light-gray) ${value}%, var(--light-gray) 100%)`;
  });
}
