(() => {
  document.querySelectorAll('.info-faq details').forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.info-faq details[open]').forEach(other => { if (other !== item) other.open = false; });
    });
  });
})();
