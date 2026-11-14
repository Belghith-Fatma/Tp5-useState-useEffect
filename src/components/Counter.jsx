import { useState, useEffect, useCallback } from 'react';
const MAX = 50;
const MIN = -50;

export default function Counter() {

  const [count, setCount] = useState(() => {
    const sauvegarde = localStorage.getItem('mon_compteur_valeur');
    return sauvegarde !== null ? parseInt(sauvegarde, 10) : 0;
  });
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('Aucun clic pour le moment');
  const [totalClics, setTotalClics] = useState(0);
  const [alerte, setAlerte] = useState('');

  const [historique, setHistorique] = useState(() => {
    try {
      const sauvegarde = localStorage.getItem('mon_compteur_historique');
      return sauvegarde !== null ? JSON.parse(sauvegarde) : [];
    } catch {
      return []; 
    }
  });


  useEffect(() => {
    document.title = 'Compteur : ' + count;
  }, [count]);

  useEffect(() => {
    localStorage.setItem('mon_compteur_valeur', count.toString());
  }, [count]);


  useEffect(() => {
    localStorage.setItem('mon_compteur_historique', JSON.stringify(historique));
  }, [historique]);


  const appliquer = useCallback(
    (signe) => {
      const nouveauCompte = count + signe * step;

  
      if (nouveauCompte > MAX) {
        setAlerte('Seuil maximal de 50 atteint !');
        return;
      }
      if (nouveauCompte < MIN) {
        setAlerte('Seuil minimal de -50 atteint !');
        return;
      }

      setAlerte('');
      setCount(nouveauCompte);
      setMessage((signe > 0 ? 'Ajout de ' : 'Retrait de ') + step);
      setTotalClics((t) => t + 1);
      // Immutabilite : nouveau tableau via spread, jamais push()
      setHistorique((h) => [...h, (signe > 0 ? '+' : '-') + step]);
    },
    [count, step]
  );

  const handleReset = () => {
    setCount(0);
    setMessage('Remise a zero');
    setTotalClics((t) => t + 1);
    setHistorique([]);
    setAlerte('');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'SELECT') return;

      if (e.key === 'ArrowUp') {
        e.preventDefault(); // evite le scroll de la page
        appliquer(+1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        appliquer(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appliquer]);

  const getStyleClass = () => {
    if (count > 0) return 'counter-display positive';
    if (count < 0) return 'counter-display negative';
    return 'counter-display zero';
  };

  return (
    <div className="counter-card">
      <div className={getStyleClass()}>{count}</div>

      <div className="btn-group">
        <button className="btn btn-dec" onClick={() => appliquer(-1)}>
          -{step}
        </button>
        <button className="btn btn-reset" onClick={handleReset}>
          Reset
        </button>
        <button className="btn btn-inc" onClick={() => appliquer(+1)}>
          +{step}
        </button>
      </div>

      {alerte && <p className="alerte">{alerte}</p>}

      <div className="step-control">
        <label>Pas d'incrementation : </label>
       <select
  value={step}
  onChange={(e) => {
    setStep(parseInt(e.target.value, 10));
    setAlerte('');
  }}
>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="5">5</option>
          <option value="10">10</option>
        </select>
      </div>

      <div className="history-card">
        <p><strong>Derniere action :</strong> {message}</p>
        <p><strong>Total des clics :</strong> {totalClics}</p>
        {historique.length > 0 && (
          <p><strong>Historique :</strong> {historique.join(', ')}</p>
        )}
      </div>
    </div>
  );
}
