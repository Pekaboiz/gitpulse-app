import DiffExample from '../shared/components/UI/DIffExample'
import { useGitApi } from '../features/git/api';
import { useEffect, useState } from 'react';
import { HistoryConfig } from '../features/git/model/gitTypes';
import HistoryContainer from '../features/git/components/HistoryContainer';

function HistoryPage() {
  const [history, setHistory] = useState<HistoryConfig>();
  const { getHistory } = useGitApi();
  
  useEffect(() => {
    loadHistory();
    console.log(getHistory());
  }, [history]);

  async function loadHistory() {
    const history = await getHistory();
    setHistory(history);
  }

  return (
    <div>
      <HistoryContainer config={history}/>
      <DiffExample/>
    </div>
  )
}

export default HistoryPage