package certgenerator

import (
	"context"
	"path/filepath"

	"github.com/grafana/dskit/services"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/modules"
	"github.com/grafana/grafana/pkg/setting"
)

const (
	DefaultAPIServerIp = "127.0.0.1"
)

var (
	_ Service = (*service)(nil)
)

type Service interface {
	services.NamedService
}

type service struct {
	*services.BasicService
	cfg      *setting.Cfg
	certUtil *CertUtil
	Log      log.Logger
}

func ProvideService(cfg *setting.Cfg) (*service, error) {
	certUtil := &CertUtil{
		K8sDataPath: filepath.Join(cfg.DataPath, "k8s"),
	}

	s := &service{
		certUtil: certUtil,
		cfg:      cfg,
		Log:      log.New("certgenerator"),
	}

	s.BasicService = services.NewIdleService(s.up, nil).WithName(modules.CertGenerator)

	return s, nil
}
func (s *service) up(ctx context.Context) error {
	err := s.certUtil.InitializeCACertPKI()
	if err != nil {
		s.Log.Error("error initializing CA", "error", err.Error())
		return err
	}

	err = s.certUtil.EnsureApiServerPKI(DefaultAPIServerIp)
	if err != nil {
		s.Log.Error("error ensuring API Server PKI", "error", err)
		return err
	}

	err = s.certUtil.EnsureAuthzClientPKI()
	if err != nil {
		s.Log.Error("error ensuring K8s Authz Client PKI", "error", err)
		return err
	}

	err = s.certUtil.EnsureAuthnClientPKI()
	if err != nil {
		s.Log.Error("error ensuring K8s Authn Client PKI", "error", err)
		return err
	}

	return nil
}
