export default function Footer() {
  return (
    <footer className="footer glass-panel">
      <div className="container">
        <div className="footer-content">
          <div>
            <h4>Prudentia College of Law</h4>
            <p style={{ color: 'var(--text-muted)' }}>
              121 King St, Melbourne VIC 3000, Australia.<br/>
              (Address placeholder from original site)
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/academics">Courses</a></li>
              <li><a href="/faculty">Faculty</a></li>
              <li><a href="/legalaid">Legal Aid</a></li>
              <li><a href="/placements">Placements</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:info@prudentiacollegeoflaw.com">info@prudentiacollegeoflaw.com</a></li>
              <li><a href="tel:(312)-895-9800">(312) 895-9800</a></li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '20px' }}>
          &copy; {new Date().getFullYear()} Prudentia College of Law. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
