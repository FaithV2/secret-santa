import { useState, useEffect } from "react";
import { addOrUpdateParticipant, getParticipants, saveAssignment, getAssignments } from "./firebase";
import { assignSecretSantaByCategory } from "./santaLogic";

// Snowflake component
const Snowflake = ({ style }) => <div style={{ ...style, position: "absolute", top: "-10px" }}>❄️</div>;

export default function SecretSantaApp() {
  const [participants, setParticipants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [myAssignment, setMyAssignment] = useState(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState(300);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [currentItem, setCurrentItem] = useState("");
  const [currentShop, setCurrentShop] = useState("");
  const [loginName, setLoginName] = useState("");
  const [saved, setSaved] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // Snow animation
  const [snowflakes, setSnowflakes] = useState([]);
  useEffect(() => {
    const flakes = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100 + "%",
      animationDuration: 5 + Math.random() * 10 + "s",
      fontSize: 10 + Math.random() * 20 + "px"
    }));
    setSnowflakes(flakes);
  }, []);

  // Countdown to draw
  const [timeLeft, setTimeLeft] = useState("");
const drawTime = new Date("2025-11-21T17:00:00"); // 5 PM draw
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = drawTime - now;
      if (diff <= 0) {
        setTimeLeft("Draw is live! Click below to see who you got!");
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      setParticipants(await getParticipants());
      setAssignments(await getAssignments());
    }
    fetchData();
  }, []);

  const handleAddWishlistItem = () => {
    if (!currentItem.trim()) return;
    const item = currentShop ? `${currentItem.trim()} (Shop: ${currentShop.trim()})` : currentItem.trim();
    setWishlistItems([...wishlistItems, item]);
    setCurrentItem("");
    setCurrentShop("");
  };

  const handleClearWishlist = () => {
    if (saved) return alert("Cannot clear wishlist after saving!");
    setWishlistItems([]);
  };

  const handleAddParticipant = async () => {
    if (!name || wishlistItems.length === 0) return alert("Fill all fields and add at least one wishlist item!");
    try {
      await addOrUpdateParticipant(name, amount, wishlistItems);
      setParticipants(await getParticipants());
      setName("");
      setWishlistItems([]);
      setCurrentItem("");
      setCurrentShop("");
      setSaved(true);
      alert("Participant saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save participant");
    }
  };

  const handleGenerateAssignments = async () => {
    const groups = {};
    participants.forEach(p => {
      if (!groups[p.amount]) groups[p.amount] = [];
      groups[p.amount].push(p);
    });
    for (const [amt, group] of Object.entries(groups)) {
      if (group.length < 2) return alert(`Amount group P${amt} must have at least 2 participants!`);
    }

    setLoading(true);
    try {
      const newAssignments = assignSecretSantaByCategory(participants);
      setAssignments(newAssignments);
      await Promise.all(
        newAssignments.map(a => saveAssignment(a.giverId, a.receiverId, a.amount, a.receiverWishlist, a.receiver))
      );
      alert("Assignments generated and saved!");
    } catch (err) {
      console.error(err);
      alert("Error generating assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    const participant = participants.find(p => p.name.toLowerCase() === loginName.toLowerCase());
    if (!participant) return alert("Name not found!");
    const now = new Date();
    if (now < drawTime) return alert("The draw hasn't started yet!");
    const assignment = assignments.find(a => a.giverId === participant.id);
    if (!assignment) return alert("Assignment not generated yet!");
    setMyAssignment(assignment);
  };

  const handleAdminLogin = () => {
    if (adminPassword === "BHG@20251") { 
      setIsAdmin(true);
      alert("Admin mode enabled");
    } else {
      alert("Wrong password");
    }
  };

  // Styling
  const cardStyle = {
    background: "#f8f8f8",
    padding: "20px",
    margin: "20px 0",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    position: "relative"
  };
  const headerStyle = { textAlign: "center", color: "#333", marginBottom: "15px" };
  const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginRight: "5px", width: "200px" };
  const buttonStyle = { padding: "8px 15px", borderRadius: "6px", border: "none", background: "#666", color: "#fff", cursor: "pointer", marginTop: "10px" };
  const wishlistListStyle = { listStyle: "none", paddingLeft: "0", marginTop: "10px" };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif", color: "#333", position: "relative" }}>
      {snowflakes.map((flake, i) => (
        <Snowflake key={i} style={{ left: flake.left, fontSize: flake.fontSize, animation: `fall ${flake.animationDuration} linear infinite` }} />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10px); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      {/* Header */}
      <div style={{ ...cardStyle, background: "#ddd", textAlign: "center" }}>
        <h1>BHG Secret Santa 2025</h1>
        <p>Gift Budget: P300 / P500 / P1000</p>
        <p>Draw Names: November 21, 2025 at 4 PM</p>
        <p>Event Date: December 13, 2025</p>
        <h2>Countdown: {timeLeft}</h2>
      </div>

      {/* Add Participant */}
      <div style={cardStyle}>
        <h2 style={headerStyle}>Add Yourself</h2>
        <input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        <select value={amount} onChange={e => setAmount(Number(e.target.value))} style={inputStyle}>
          <option value={300}>P300</option>
          <option value={500}>P500</option>
          <option value={1000}>P1000</option>
        </select>
        <div style={{ marginTop: "10px" }}>
          <input placeholder="Wishlist Item" value={currentItem} onChange={e => setCurrentItem(e.target.value)} style={inputStyle} />
          <input placeholder="Optional Shop" value={currentShop} onChange={e => setCurrentShop(e.target.value)} style={inputStyle} />
          <button onClick={handleAddWishlistItem} style={buttonStyle}>Add Item</button>
          <button onClick={handleClearWishlist} style={{ ...buttonStyle, background: "#999", marginLeft: "5px" }}>Clear</button>
        </div>
        {wishlistItems.length > 0 && (
          <ul style={wishlistListStyle}>
            {wishlistItems.map((item, idx) => <li key={idx}>- {item}</li>)}
          </ul>
        )}
        <button onClick={handleAddParticipant} style={buttonStyle}>Save </button>
      </div>

      {/* Draw Section */}
      <div style={cardStyle}>
        <h2 style={headerStyle}>Who You Got</h2>
        {!myAssignment ? (
          <>
            <input placeholder="Enter your name" value={loginName} onChange={e => setLoginName(e.target.value)} style={inputStyle} />
            <button onClick={handleLogin} style={buttonStyle}>See Who You Got</button>
          </>
        ) : (
          <div>
            <h3>You Got: {myAssignment.receiver}</h3>
            <p>
              Wishlist:
              <ul style={wishlistListStyle}>
                {Array.isArray(myAssignment.receiverWishlist) && myAssignment.receiverWishlist.length > 0
                  ? myAssignment.receiverWishlist.map((item, idx) => <li key={idx}>- {item}</li>)
                  : <li>No wishlist</li>}
              </ul>
              Amount: P{myAssignment.amount}
            </p>
          </div>
        )}
      </div>

      {/* Admin View */}
      {!isAdmin && (
        <div style={cardStyle}>
          <h2 style={headerStyle}>Admin Login</h2>
          <input type="password" placeholder="Enter admin password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} style={inputStyle} />
          <button onClick={handleAdminLogin} style={buttonStyle}>Who Everyone Got</button>
        </div>
      )}
      {isAdmin && (
        <div style={cardStyle}>
          <h2 style={headerStyle}>Who Everyone Got (Admin)</h2>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {participants.map(p => {
              const assignment = assignments.find(a => a.giverId === p.id);
              return (
                <li key={p.id}>
                  <strong>{p.name}</strong> → {assignment ? assignment.receiver : "Not drawn yet"}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
