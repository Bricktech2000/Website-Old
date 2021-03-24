self.addEventListener('push', event => {
  var data = event.data.json();
  self.registration.showNotification(data.title, data);
});