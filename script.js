// Countdown
const countdown = document.getElementById('countdown');
const weddingDate = new Date("July 20, 2026 16:00:00").getTime();

const timer = setInterval(function() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  countdown.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  if (distance < 0) {
    clearInterval(timer);
    countdown.innerHTML = "Oggi è il grande giorno! 💍";
  }
}, 1000);


//form
  const adultsCountInput = document.getElementById('adultsCount');
  const childrenCountInput = document.getElementById('childrenCount');
  const adultsNamesDiv = document.getElementById('adultsNamesDiv');
  const childrenNamesDiv = document.getElementById('childrenNames');
  const form = document.getElementById('rsvpForm');
  const responseMessage = document.getElementById('responseMessage');

  function buildPersonFields(container, count, type) {
    container.innerHTML = ''; // reset

    for (let i = 1; i <= count; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = `${type}-person`;
      wrapper.innerHTML = `
        <fieldset style="margin-bottom:0.5em; padding:6px; border:1px solid #ccc;">
          <legend>${type === 'adulto' ? 'Adulto' : 'Bambino'} ${i}</legend>
          <label>Nome: <input type="text" name="${type}_nome_${i}" required></label>
          <label>Cognome: <input type="text" name="${type}_cognome_${i}" required></label>
        </fieldset>
      `;
      container.appendChild(wrapper);
    }
  }

 
  adultsCountInput.addEventListener('input', () => {
    const c = Math.max(0, parseInt(adultsCountInput.value, 10) || 0);
    buildPersonFields(adultsNamesDiv, c, 'adulto');
  });

  childrenCountInput.addEventListener('input', () => {
    const c = Math.max(0, parseInt(childrenCountInput.value, 10) || 0);
    buildPersonFields(childrenNamesDiv, c, 'bambino');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    responseMessage.textContent = '';

    const numeriAdulti = parseInt(adultsCountInput.value, 10) || 0;
    const numeriBambini = parseInt(childrenCountInput.value, 10) || 0;
    const note = document.getElementById('note').value.trim();

    const invitati = [];

    // adulti
    for (let i = 1; i <= numeriAdulti; i++) {
      const nomeField = form[`adulto_nome_${i}`];
      const cognomeField = form[`adulto_cognome_${i}`];
      if (!nomeField || !cognomeField) {
        responseMessage.style.color = 'red';
        responseMessage.textContent = `Mancano nome/cognome per adulto ${i}`;
        return;
      }
      invitati.push({
        nome: nomeField.value.trim(),
        cognome: cognomeField.value.trim(),
        email: null, // se hai email aggiungi campo nel form
        numeriAdulti: 1,
        numeriBambini: 0,
        note: note
      });
    }

    // bambini
    for (let i = 1; i <= numeriBambini; i++) {
      const nomeField = form[`bambino_nome_${i}`];
      const cognomeField = form[`bambino_cognome_${i}`];
      if (!nomeField || !cognomeField) {
        responseMessage.style.color = 'red';
        responseMessage.textContent = `Mancano nome/cognome per bambino ${i}`;
        return;
      }
      invitati.push({
        nome: nomeField.value.trim(),
        cognome: cognomeField.value.trim(),
        email: null,
        numeriAdulti: 0,
        numeriBambini: 1,
        note: note
      });
    }

    if (invitati.length === 0) {
      responseMessage.style.color = 'red';
      responseMessage.textContent = 'Devi inserire almeno un invitato.';
      return;
    }

    // invio al backend
    try {
      const resp = await fetch('https://backend-wedding-wbox.onrender.com/invitati/api/save-invitati',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invitati)
      });
      console.log(invitati);
      if (resp.ok) {
        console.log(resp);
        responseMessage.style.color = 'green';
        responseMessage.textContent = 'Conferma inviata con successo!';
        form.reset();
        adultsNamesDiv.innerHTML = '';
        childrenNamesDiv.innerHTML = '';
      } else {
        const errText = await resp.text();
        responseMessage.style.color = 'red';
        responseMessage.textContent = 'Errore dal server: ' + errText;
      }
    } catch (err) {
      responseMessage.style.color = 'red';
      responseMessage.textContent = 'Errore di rete, riprova.';
      console.error(err);
    }
  });

  // Inizializza i campi se c'è un valore preimpostato
  buildPersonFields(adultsNamesDiv, parseInt(adultsCountInput.value,10), 'adulto');
  buildPersonFields(childrenNamesDiv, parseInt(childrenCountInput.value,10), 'bambino');
