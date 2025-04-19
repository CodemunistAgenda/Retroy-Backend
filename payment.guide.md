# 🛒 Legale Zahlungsintegration in meinem Onlineshop (Stripe + PayPal)

## 📌 Ziel

Dieses Projekt implementiert einen Prototyp für einen rechtlich korrekten Onlineshop mit funktionierender Zahlungsabwicklung über **Kreditkarte**, **SEPA-Lastschrift (Bankzahlung)** und **PayPal**. Dabei werden **keine sensiblen Zahlungsdaten** selbst gespeichert, sondern moderne Zahlungsanbieter (z. B. Stripe) verwendet.

---

## 🔐 1. Datenschutz & Rechtliches

### Grundprinzipien (DSGVO-konform):

- **Zahlungsdaten** werden **niemals** in der eigenen Datenbank gespeichert.
- Es werden **nur Tokens oder Referenzen** auf externe Anbieter (z. B. Stripe-PaymentIntent-ID) gespeichert.
- Die Verbindung zur Zahlungsplattform erfolgt **ausschließlich über HTTPS und abgesicherte APIs**.
- **Nur Bestelldaten** mit Zahlungsreferenz (nicht die Zahlungsdaten selbst!) werden dauerhaft gespeichert.

---

## 💾 2. Was wird wann im Backend gespeichert?

| Phase          | Speicherort            | Inhalt                                                               |
| -------------- | ---------------------- | -------------------------------------------------------------------- |
| Beim Checkout  | Stripe (intern)        | Zahlungsdaten (Karte, IBAN, PayPal-Konto), verschlüsselt gespeichert |
|                | Backend (temporär)     | `customerId`, `paymentMethodId`, `paymentIntentId`, etc.             |
| Nach Bezahlung | Datenbank (Bestellung) | `orderId`, `userId`, `paymentIntentId`, `paymentStatus`, `amount`    |

✅ Nur Stripe verarbeitet sensible Daten.  
✅ Deine Datenbank speichert nur Meta-Daten (z. B. IDs, Beträge, Status).

---

## 🧩 3. Frontend: Was muss für jede Zahlungsart eingebunden werden?

### 🔹 Kreditkarte (Stripe Elements)

- Stripe JS SDK laden:
  ```html
  <script src="https://js.stripe.com/v3/"></script>
  ```
