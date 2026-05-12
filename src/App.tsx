import "./styles/reset.css"
import "./styles/global.css"
import { ActiveTabProvider } from "./features/git/hooks/ActiveTabContext";
import AppLayout from "./app/AppLayout";
import { LoadingProvider } from "./features/git/hooks/LoaderStates";
import { ActiveRepositoryProvider } from "./features/git/hooks/ActiveRepository";

function App() {
  
  return (
    <LoadingProvider>
      <ActiveTabProvider>
        <ActiveRepositoryProvider>
          <AppLayout/>
        </ActiveRepositoryProvider>
      </ActiveTabProvider>
    </LoadingProvider>

  );
}

export default App;
