import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import api from "../api";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      if (!user) {
        setSummary(null);
        return;
      }
      setSummaryLoading(true);
      try {
        if (user.role === "donor") {
          const res = await api.get("/donations/mine");
          const items = res.data || [];
          const total = items.length;
          const open = items.filter((d) => d.status === "Open").length;
          const reserved = items.filter((d) => d.status === "Reserved").length;
          const completed = items.filter((d) => d.status === "Completed").length;
          setSummary({
            mode: "donor",
            total,
            open,
            reserved,
            completed
          });
        } else if (user.role === "npo") {
          const res = await api.get("/requests");
          const requests = res.data || [];
          const pending = requests.filter((r) => r.status === "pending").length;
          const accepted = requests.filter((r) => r.status === "accepted").length;
          const rejected = requests.filter((r) => r.status === "rejected").length;
          setSummary({
            mode: "npo",
            pending,
            accepted,
            rejected,
            total: requests.length
          });
        }
      } catch (e) {
        setSummary(null);
      } finally {
        setSummaryLoading(false);
      }
    }

    loadSummary();
  }, [user]);

  return (
    <div className="landing-page">
      <section className="landing-hero-main">
        <div className="landing-hero-body">
          <div className="landing-hero-copy">
            <div className="landing-highlight">
              <span>🌍 Coordinate physical donations, not just money</span>
            </div>
            <h1 className="landing-title">
              One dashboard for donors and NGOs.
            </h1>
            <p className="landing-sub">
              Publish items, request pickups and follow every donation from{" "}
              <strong>Open</strong> to <strong>Completed</strong>. DonorConnect
              gives you one simple place to manage all of this, instead of
              scattered chats and spreadsheets.
            </p>

            <div className="landing-hero-bottom">
              <div className="landing-cta-row">
                {!user && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate("/register")}
                    >
                      Get started as a donor
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate("/login")}
                    >
                      I already have an account
                    </button>
                  </>
                )}

                {user && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        user.role === "donor"
                          ? navigate("/donations/new")
                          : navigate("/donations")
                      }
                    >
                      Go to my dashboard
                    </button>
                    <span className="tag">Logged in as {user.name}</span>
                  </>
                )}
              </div>

              <div className="landing-stats">
                <div className="landing-stat">
                  ✅ Clear statuses: Open / Reserved / Completed
                </div>
                <div className="landing-stat">📷 Photo for each donation</div>
                <div className="landing-stat">
                  📅 NGOs propose pickup dates directly
                </div>
              </div>
            </div>

            {user && (
              <div className="analytics-row">
                {summaryLoading && (
                  <div className="analytics-card">
                    <div className="analytics-label">Loading your stats…</div>
                  </div>
                )}

                {!summaryLoading && summary && summary.mode === "donor" && (
                  <>
                    <div className="analytics-card">
                      <div className="analytics-label">Total donations</div>
                      <div className="analytics-value">{summary.total}</div>
                    </div>
                    <div className="analytics-card">
                      <div className="analytics-label">Open</div>
                      <div className="analytics-value">{summary.open}</div>
                    </div>
                    <div className="analytics-card">
                      <div className="analytics-label">Completed</div>
                      <div className="analytics-value">
                        {summary.completed}
                      </div>
                    </div>
                  </>
                )}

                {!summaryLoading && summary && summary.mode === "npo" && (
                  <>
                    <div className="analytics-card">
                      <div className="analytics-label">Pending requests</div>
                      <div className="analytics-value">
                        {summary.pending}
                      </div>
                    </div>
                    <div className="analytics-card">
                      <div className="analytics-label">Accepted</div>
                      <div className="analytics-value">
                        {summary.accepted}
                      </div>
                    </div>
                    <div className="analytics-card">
                      <div className="analytics-label">Total requests</div>
                      <div className="analytics-value">{summary.total}</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="landing-hero-preview">
            <div className="landing-preview-header">
              <div>
                <div className="landing-preview-title">
                  Snapshot of a real donor dashboard
                </div>
                <div className="landing-preview-status">
                  3 active donations · 2 pending pickup requests
                </div>
              </div>
            </div>

            <div className="landing-preview-list">
              <div className="landing-preview-item">
                <div>
                  <span className="landing-preview-label">
                    Winter jackets · Paris
                  </span>
                  <span>4 items · available from 12/01</span>
                </div>
                <span className="landing-preview-badge landing-preview-badge--open">
                  Open
                </span>
              </div>
              <div className="landing-preview-item">
                <div>
                  <span className="landing-preview-label">
                    Office chairs · Nanterre
                  </span>
                  <span>5 items · pickup scheduled tomorrow</span>
                </div>
                <span className="landing-preview-badge landing-preview-badge--reserved">
                  Reserved
                </span>
              </div>
              <div className="landing-preview-item">
                <div>
                  <span className="landing-preview-label">
                    Food boxes · La Défense
                  </span>
                  <span>12 boxes · collected last week</span>
                </div>
                <span className="landing-preview-badge landing-preview-badge--completed">
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-workflow">
        <div>
          <div className="landing-workflow-title">
            How DonorConnect structures your workflow
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
            Same platform for donors and NGOs. Each side sees what they need,
            with clear statuses and history.
          </p>
        </div>
        <div className="landing-workflow-steps">
          <div className="landing-workflow-step">
            <span>1️⃣</span>
            <span>Donor publishes an item with photo, quantity and location.</span>
          </div>
          <div className="landing-workflow-step">
            <span>2️⃣</span>
            <span>
              NPO sends a pickup request (message + preferred date) in one click.
            </span>
          </div>
          <div className="landing-workflow-step">
            <span>3️⃣</span>
            <span>
              Donor accepts / rejects. Both follow the request status until
              completion.
            </span>
          </div>
        </div>
      </section>

      <section className="landing-grid">
        <article className="landing-card">
          <h3>For individual donors</h3>
          <p>
            Turn your extra clothes, furniture, food and equipment into
            something useful instead of leaving them in storage.
          </p>
          <ul className="landing-role-list">
            <li>• Publish donations with quantity, condition and photo.</li>
            <li>• Set your pickup address and availability date.</li>
            <li>• Receive structured requests instead of random messages.</li>
            <li>• Mark donations as completed once picked up.</li>
          </ul>
        </article>

        <article className="landing-card">
          <h3>For NGOs / NPOs</h3>
          <p>
            Quickly see what is available around you and schedule pickups in a
            structured way with donors.
          </p>
          <ul className="landing-checklist">
            <li>
              <span>✅</span>
              <span>Filter for open donations you can actually collect.</span>
            </li>
            <li>
              <span>✅</span>
              <span>
                Send pickup requests with a clear message and preferred date.
              </span>
            </li>
            <li>
              <span>✅</span>
              <span>See instantly when a donor has accepted your request.</span>
            </li>
            <li>
              <span>✅</span>
              <span>
                Keep a history of what was collected, when and from whom.
              </span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
