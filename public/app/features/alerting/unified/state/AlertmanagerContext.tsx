import * as React from 'react';

import { useQueryParams } from 'app/core/hooks/useQueryParams';
import store from 'app/core/store';

import { useAlertManagersByPermission } from '../hooks/useAlertManagerSources';
import { ALERTMANAGER_NAME_LOCAL_STORAGE_KEY, ALERTMANAGER_NAME_QUERY_KEY } from '../utils/constants';
import { AlertManagerDataSource, GRAFANA_RULES_SOURCE_NAME } from '../utils/datasource';

interface Context {
  permissions: 'instance' | 'notification';
  selectedAlertmanager: string | undefined;
  availableAlertManagers: AlertManagerDataSource[];
  setSelectedAlertmanager: (name: string) => void;
  setPermissions: (accessType: Context['permissions']) => void;
}

const SelectedAlertmanagerContext = React.createContext<Context | undefined>(undefined);

// TODO don't use setPermissions but pass permissions down to the alertmanager provider via props
const SelectedAlertmanagerProvider = ({ children }: React.PropsWithChildren) => {
  const [permissions, setPermissions] = React.useState<Context['permissions']>('instance');
  const [queryParams, updateQueryParams] = useQueryParams();
  const availableAlertManagers = useAlertManagersByPermission(permissions);

  const updateSelectedAlertmanager = React.useCallback(
    (selectedAlertManager: string) => {
      if (!isAlertManagerAvailable(availableAlertManagers, selectedAlertManager)) {
        return;
      }

      if (selectedAlertManager === GRAFANA_RULES_SOURCE_NAME) {
        store.delete(ALERTMANAGER_NAME_LOCAL_STORAGE_KEY);
        updateQueryParams({ [ALERTMANAGER_NAME_QUERY_KEY]: null });
      } else {
        store.set(ALERTMANAGER_NAME_LOCAL_STORAGE_KEY, selectedAlertManager);
        updateQueryParams({ [ALERTMANAGER_NAME_QUERY_KEY]: selectedAlertManager });
      }
    },
    [availableAlertManagers, updateQueryParams]
  );

  const sourceFromQuery = queryParams[ALERTMANAGER_NAME_QUERY_KEY];
  const sourceFromStore = store.get(ALERTMANAGER_NAME_LOCAL_STORAGE_KEY);
  const defaultSource = GRAFANA_RULES_SOURCE_NAME;

  // queryParam > localStorage > default
  const desiredAlertmanager = sourceFromQuery ?? sourceFromStore ?? defaultSource;
  const selectedAlertmanager = isAlertManagerAvailable(availableAlertManagers, desiredAlertmanager)
    ? desiredAlertmanager
    : undefined;

  const value: Context = {
    selectedAlertmanager,
    permissions,
    setPermissions,
    availableAlertManagers,
    setSelectedAlertmanager: updateSelectedAlertmanager,
  };

  return <SelectedAlertmanagerContext.Provider value={value}>{children}</SelectedAlertmanagerContext.Provider>;
};

interface Props {
  withPermissions: Context['permissions'];
}

function useSelectedAlertmanager(props?: Props) {
  const context = React.useContext(SelectedAlertmanagerContext);

  if (context === undefined) {
    throw new Error('useSelectedAlertmanager must be used within a SelectedAlertmanagerContext');
  }

  React.useEffect(() => {
    if (props?.withPermissions) {
      context.setPermissions(props.withPermissions);
    }
  }, [context, props]);

  return context;
}

export { SelectedAlertmanagerProvider, useSelectedAlertmanager };

function isAlertManagerAvailable(availableAlertManagers: AlertManagerDataSource[], alertManagerName: string) {
  const availableAlertManagersNames = availableAlertManagers.map((am) => am.name);
  return availableAlertManagersNames.includes(alertManagerName);
}
