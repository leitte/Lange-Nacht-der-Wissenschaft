const csvUrl = 'enter url here';

const DashboardData = {
    data: null,
    subscribers: [],
    subscribe(callback) {
      this.subscribers.push(callback);
      if (this.data) callback(this.data);
    },
    notify() {
      this.subscribers.forEach(cb => cb(this.data));
    },
    fetchData() {
        var rand = Math.floor(Math.random() * 1000000);
        console.log(csvUrl + rand)
      fetch(csvUrl + rand)
        .then(res => res.text())
        .then(csvText => {
          const parsed = Papa.parse(csvText, { header: true }).data;
          this.data = parsed;
          this.notify();
        })
        .catch(err => console.error("Error loading CSV data:", err));
    },
    startPolling(intervalMs = 60000) { // default: 60 seconds
      this.fetchData(); // initial load
      console.log('loaded data')
      setInterval(() => this.fetchData(), intervalMs);
    }
  };
  
  DashboardData.startPolling(); // call to begin refreshing