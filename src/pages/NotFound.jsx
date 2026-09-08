import { Link } from 'react-router-dom'
import { Page } from '../components/Reveal'
import { EmptyState } from '../components/SectionHead'

export default function NotFound() {
  return (
    <Page>
      <div className="wrap section">
        <EmptyState
          title="404 — wrong door" sub="This page wandered off with someone else's tote bag."
          action={
            <div className="empty__ctas">
              <Link to="/" className="btn btn--line btn--sm">Home</Link>
              <Link to="/menu" className="btn btn--solid btn--sm">Coffee menu</Link>
            </div>
          }
        />
      </div>
    </Page>
  )
}
