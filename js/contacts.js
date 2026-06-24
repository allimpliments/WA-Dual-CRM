const Contacts = {
  render() {
    const contacts = [
      { id:1, firstName:'John', lastName:'Doe', mobile:'+1234567890', group:'Customers' },
      { id:2, firstName:'Jane', lastName:'Smith', mobile:'+0987654321', group:'Leads' }
    ];
    let html = `
      <div class="card-widget">
        <h4>Contacts</h4>
        <button class="btn btn-primary btn-sm mb-3"><i class="fas fa-plus"></i> Add Contact</button>
        <table class="table">
          <thead><tr><th>Name</th><th>Phone</th><th>Group</th><th>Action</th></tr></thead>
          <tbody>
            ${contacts.map(c => `
              <tr>
                <td>${c.firstName} ${c.lastName}</td><td>${c.mobile}</td><td>${c.group}</td>
                <td><button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    contentArea.innerHTML = html;
  }
};