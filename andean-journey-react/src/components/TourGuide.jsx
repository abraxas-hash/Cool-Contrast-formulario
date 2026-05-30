import { Joyride, STATUS } from 'react-joyride';

export const TourGuide = ({ run, setRun }) => {
  const steps = [
    {
      target: 'body',
      content: (
        <div>
          <h2 className="text-xl font-bold mb-2 text-slate-800">¡Bienvenido a tu Nuevo Sistema! 🚀</h2>
          <p className="text-slate-600">
            Hemos preparado un breve recorrido para enseñarte cómo usar esta plataforma diseñada especialmente para escalar tus ventas.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-stats',
      content: (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Métricas en Tiempo Real</h3>
          <p className="text-slate-600 text-sm">
            Monitorea el rendimiento de tu agencia. Aquí verás cuántos tours has vendido y el estado general de tus conversiones.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-generate-btn',
      content: (
        <div>
          <h3 className="text-lg font-bold text-cyan-600 mb-1">⚡ El Corazón del Sistema</h3>
          <p className="text-slate-600 text-sm">
            ¡Usa este botón para generar PDFs interactivos y premium al instante! Con esto deslumbrarás a tus clientes.
          </p>
        </div>
      ),
      placement: 'bottom-end',
    },
    {
      target: '.tour-sales',
      content: (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Análisis de Ventas</h3>
          <p className="text-slate-600 text-sm">
            Toma decisiones basadas en datos. Aquí podrás comparar el rendimiento mensual de tus programas fijos vs personalizados.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-calendar',
      content: (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Agenda Operativa</h3>
          <p className="text-slate-600 text-sm">
            Mantén el control total de las salidas programadas, gestiona el estatus de las cotizaciones y visualiza la ruta de hoy.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-destinations',
      content: (
        <div>
          <h3 className="text-lg font-bold text-[#00A884] mb-1">Paisajes y Destinos</h3>
          <p className="text-slate-600 text-sm">
            Tus paquetes turísticos visualizados. Explora las salidas cercanas y los destinos andinos más populares con un solo clic.
          </p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '.tour-kanban',
      content: (
        <div>
          <h3 className="text-lg font-bold text-[#00A884] mb-1">Tablero Kanban</h3>
          <p className="text-slate-600 text-sm">
            Tu embudo de ventas. Mueve a tus clientes desde "Nuevas Solicitudes" hasta "Listos para Enviar". 
            ¡Da seguimiento a cada oportunidad!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-kanban-sync',
      content: (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Sincronización en la Nube</h3>
          <p className="text-slate-600 text-sm">
            Haz clic aquí para extraer las nuevas respuestas de tus clientes desde Google Sheets directamente a tu tablero.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-dock',
      content: (
        <div>
          <h3 className="text-lg font-bold text-[#25D366] mb-1">Menú Premium</h3>
          <p className="text-slate-600 text-sm">
            Navega entre tus diferentes paneles con esta elegante barra estilo Mac. 
            También tienes un botón rápido para cotizar a la mano.
          </p>
        </div>
      ),
      placement: 'top',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar Tutorial'
      }}
      styles={{
        options: {
          arrowColor: '#0f172a',
          backgroundColor: '#0f172a',
          overlayColor: 'rgba(0, 0, 0, 0.8)',
          primaryColor: '#0ea5e9',
          textColor: '#f8fafc',
          width: 400,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          padding: '20px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#0ea5e9',
          borderRadius: '8px',
          padding: '8px 16px',
          fontWeight: 'bold',
        },
        buttonBack: {
          color: '#94a3b8',
          marginRight: '10px',
        },
        buttonSkip: {
          color: '#94a3b8',
          fontWeight: 'normal',
        }
      }}
    />
  );
};
