const Leads = {
  render() {
    const leads = [
      { id:1, name:'Ravi Kumar', phone:'+919810012345', email:'ravi@example.com', source:'Facebook', status:'New' },
      { id:2, name:'Priya Sharma', phone:'+919876543210', email:'priya@example.com', source:'Website', status:'Contacted' }
    ];
    let html = `
      <div class="card-widget">
        <h4>Lead Management</h4>
        <button class="btn btn-primary btn-sm mb-3" onclick="alert('Add Lead form coming soon')"><i class="fas fa-plus"></i> Add Lead</button>
        <table class="table">
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Source</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            ${leads.map(lead => `
              <tr>
                <td>${lead.name}</td><td>${lead.phone}</td><td>${lead.email}</td>
                <td>${lead.source}</td><td><span class="badge bg-info">${lead.status}</span></td>
                <td><button class="btn btn-sm btn-outline-danger" onclick="alert('Delete feature soon')"><i class="fas fa-trash"></i></button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    contentArea.innerHTML = html;
  }
};