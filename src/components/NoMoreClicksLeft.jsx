import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

export default function NoMoreClicksLeft() {
  const navigate = useNavigate();
  const { user } = UserAuth();

  function closeModal() {
    navigate("/account");
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(75, 85, 99, 0.5)",
        fontFamily: "Arial, sans-serif", // 👈 font forzato
      }}
    >
      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "16px",
            color: "#9333ea",
          }}
        >
          Hai finito i click disponibili per questo minigioco!
        </h3>
        <p
          style={{
            textAlign: "center",
            marginBottom: "24px",
            color: "#374151",
          }}
        >
          {user.email}! Passa ad un altro livello!
        </p>
        <div style={{ textAlign: "center" }}>
          <button
            onClick={closeModal}
            style={{
              backgroundColor: "#9333ea",
              color: "white",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              fontFamily: "Arial, sans-serif", // 👈 anche sul bottone
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#7e22ce")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#9333ea")
            }
          >
            Ok, torna alla Home
          </button>
        </div>
      </div>
    </div>
  );
}
