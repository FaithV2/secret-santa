import { useState, useEffect } from "react";
import { addOrUpdateParticipant, getParticipants, saveAssignment, getAssignments } from "./firebase";
import { drawForSelf } from "./santaLogic";

const Snowflake = ({ style }) => (
  <div style={{ ...style, position: "absolute", top: "-10px" }}>❄️</div>
);

export default function SecretSantaApp() {
  const [participants, setParticipants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [myAssignment, setMyAssignment] = useState(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(300);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [currentItem, setCurrentItem] = useState("");
  const [currentShop, setCurrentShop] = useState("");

  const [loginName, setLoginName] = useState("");
  const [saved, setSaved] = useState(false);

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAllowed, setIsAdminAllowed] = useState(false);
  const correctPassword = "BHG@20251";

  // Snowflakes
  const [snowflakes, setSnowflakes] = useState([]);
  useEffect(() => {
    const flakes = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100 + "%",
      animationDuration: 5 + Math.random() * 10 + "s",
      fontSize: 10 + Math.random() * 20 + "px"
    }));
    setSnowflakes(flakes);
  }, []);

  // Countdown
  const [timeLeft, setTimeLeft] = useState("");
  const drawTime = new Date("2025-11-21T17:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = drawTime - now;

      if (diff <= 0) {
        setTimeLeft("Draw is live! Scroll down and see who you got!");
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load data
  useEffect(() => {
    async function fetchData() {
      setParticipants(await getParticipants());
      setAssignments(await getAssignments());
    }
    fetchData();
  }, []);

  // Wishlist
  const handleAddWishlistItem = () => {
    if (!currentItem.trim()) return;
    const item = currentShop
      ? `${currentItem.trim()} (Shop: ${currentShop.trim()})`
      : currentItem.trim();

    setWishlistItems([...wishlistItems, item]);
    setCurrentItem("");
    setCurrentShop("");
  };

  const handleClearWishlist = () => {
    if (saved) return alert("Cannot clear wishlist after saving!");
    setWishlistItems([]);
  };

  // Save participant
  const handleAddParticipant = async () => {
    if (!name || wishlistItems.length === 0)
      return alert("Fill all fields and add at least one wishlist item!");

    try {
      await addOrUpdateParticipant(name, amount, wishlistItems);
      setParticipants(await getParticipants());
      setName("");
      setWishlistItems([]);
      setCurrentItem("");
      setCurrentShop("");
      setSaved(true);
      alert("Saved! Scroll down to draw on the day of reveal.");
    } catch {
      alert("Failed to save participant");
    }
  };

  // Draw
  const handleSelfDraw = async () => {
    const participant = participants.find(
      (p) => p.name.toLowerCase() === loginName.toLowerCase()
    );
    if (!participant) return alert("Name not found!");

    const now = new Date();
    if (now < drawTime) return alert("The draw hasn't started yet!");

    const result = drawForSelf(participant.id, participants, assignments);

    if (result.error) return alert(result.error);
    if (result.already) return setMyAssignment(result.already);

    await saveAssignment(
      result.giverId,
      result.receiverId,
      result.amount,
      result.receiverWishlist,
      result.receiver
    );

    setAssignments(await getAssignments());
    setMyAssignment(result);
  };

  // Admin calculations
  const undrawnParticipants = participants.filter(
    (p) => !assignments.some((a) => a.giverId === p.id)
  );

  const unassignedReceivers = participants.filter(
    (p) => !assignments.some((a) => a.receiverId === p.id)
  );

  // Styles
  const cardStyle = {
    background: "#f8f8f8",
    padding: "20px",
    margin: "20px 0",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    position: "relative"
  };

  const headerStyle = {
    textAlign: "center",
    color: "#333",
    marginBottom: "15px"
  };

  const inputStyle = {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginRight: "5px",
    width: "200px"
  };

  const buttonStyle = {
    padding: "8px 15px",
    borderRadius: "6px",
    border: "none",
    background: "#666",
    color: "#fff",
    cursor: "pointer",
    marginTop: "10px"
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", fontFamily: "Segoe UI", color: "#333" }}>

      {/* Instructions */}
      <div style={{ textAlign: "center", padding: "10px", fontSize: "0.9em", color: "#555" }}>
        ⬇️ Scroll down for steps & drawing ⬇️
      </div>

      {/* HOW TO USE */}
      <div style={cardStyle}>
        <h2 style={headerStyle}>How to Use This Secret Santa 🎄</h2>
        <ul>
          <li>1. Add yourself using the form below.</li>
          <li>2. On draw day, scroll to "Who You Got".</li>
          <li>3. Enter your name exactly as saved.</li>
          <li>4. The app shows who you got + wishlist.</li>
        </ul>
      </div>

      {/* ADD SELF */}
      <div style={cardStyle}>
        <h2 style={headerStyle}>Add Yourself</h2>

        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <select
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={inputStyle}
        >
          <option value={300}>P300</option>
          <option value={500}>P500</option>
          <option value={1000}>P1000</option>
        </select>

        <div style={{ marginTop: "10px" }}>
          <input
            placeholder="Wishlist Item"
            value={currentItem}
            onChange={(e) => setCurrentItem(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Optional Shop"
            value={currentShop}
            onChange={(e) => setCurrentShop(e.target.value)}
            style={inputStyle}
          />

          <button onClick={handleAddWishlistItem} style={buttonStyle}>
            Add Item
          </button>
        </div>

        {wishlistItems.length > 0 && (
          <ul>
            {wishlistItems.map((i, idx) => (
              <li key={idx}>- {i}</li>
            ))}
          </ul>
        )}

        <button onClick={handleAddParticipant} style={buttonStyle}>
          Save
        </button>
      </div>

      {/* DRAW SECTION */}
      <div style={cardStyle}>
        <h2 style={headerStyle}>Who You Got</h2>

        {!myAssignment ? (
          <>
            <input
              placeholder="Enter your name"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handleSelfDraw} style={buttonStyle}>
              Draw
            </button>
          </>
        ) : (
          <div>
            <h3>You Got: {myAssignment.receiver}</h3>
            <ul>
              {myAssignment.receiverWishlist?.length ? (
                myAssignment.receiverWishlist.map((i, idx) => <li key={idx}>- {i}</li>)
              ) : (
                <li>No wishlist</li>
              )}
            </ul>
            <p>Amount: P{myAssignment.amount}</p>
          </div>
        )}
      </div>

      {/* ADMIN PANEL */}
      <div style={cardStyle}>
        <h2 style={headerStyle}>Admin</h2>

        <button
          onClick={() => setAdminOpen(!adminOpen)}
          style={{ ...buttonStyle, background: adminOpen ? "#444" : "#666" }}
        >
          {adminOpen ? "Hide Admin Panel" : "Show Admin Panel"}
        </button>

        {/* PASSWORD */}
        {adminOpen && !isAdminAllowed && (
          <div style={{ marginTop: "15px" }}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              style={inputStyle}
            />

            <button
              onClick={() => {
                if (adminPassword === correctPassword) setIsAdminAllowed(true);
                else alert("Wrong password!");
              }}
              style={buttonStyle}
            >
              Unlock
            </button>
          </div>
        )}

        {/* ADMIN CONTENT */}
        {adminOpen && isAdminAllowed && (
          <div style={{ marginTop: "15px" }}>
            {/* UNDRAWN */}
            <h3>People Who Haven’t Drawn Yet</h3>
            {undrawnParticipants.length === 0 ? (
              <p>Everyone has drawn!</p>
            ) : (
              <ul>
                {undrawnParticipants.map((p, i) => (
                  <li key={i}>{p.name} — Budget: P{p.amount}</li>
                ))}
              </ul>
            )}

            {/* UNASSIGNED */}
            <h3 style={{ marginTop: "20px" }}>People Who Haven’t Been Picked Yet</h3>
            {unassignedReceivers.length === 0 ? (
              <p>Everyone has been assigned!</p>
            ) : (
              <ul>
                {unassignedReceivers.map((p, i) => (
                  <li key={i}>{p.name}</li>
                ))}
              </ul>
            )}

            {/* TABLE */}
            <h3 style={{ marginTop: "25px" }}>All Assignments</h3>
            {assignments.length === 0 ? (
              <p>No assignments yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#ddd" }}>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Giver</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Receiver</th>
                    <th style={{ padding: "8px", border: "1px solid #ccc" }}>Budget</th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.map((a, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{a.giverId}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>{a.receiver}</td>
                      <td style={{ padding: "8px", border: "1px solid #ccc" }}>P{a.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
