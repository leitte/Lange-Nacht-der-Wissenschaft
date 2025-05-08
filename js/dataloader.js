const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTsDoYiGxoYXJuvUnNolA1Sn6QNYGGhjcDP-lFaEp79V-VIvpt0nui2IUwvZIDkMyMdl3hIzN_4-ae8/pub?output=csv&foo=';

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
    startPolling(intervalMs = 30000) { // default: 30 seconds
      this.fetchData(); // initial load
      console.log('loaded data')
      setInterval(() => this.fetchData(), intervalMs);
    }
  };
  
  DashboardData.startPolling(); // call to begin refreshing