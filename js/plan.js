const Plan = {
  render() {
    contentArea.innerHTML = `
      <div class="card-widget">
        <h4><i class="fas fa-wallet text-success me-2"></i>My Plan</h4>
        <p>Current Plan: <strong>Premium</strong></p>
        <button class="btn btn-outline-primary btn-sm">Change Plan</button>
      </div>
    `;
  }
};
