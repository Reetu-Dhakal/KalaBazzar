import toast from 'react-hot-toast';

const defaultStyle = {
  background: '#3A2A1F',
  color: '#FBEED3',
  borderRadius: '12px',
  fontSize: '14px',
};

const successStyle = {
  ...defaultStyle,
  borderLeft: '4px solid #059669',
};

const errorStyle = {
  ...defaultStyle,
  borderLeft: '4px solid #DC2626',
};

const infoStyle = {
  ...defaultStyle,
  borderLeft: '4px solid #C89B3C',
};

const useToast = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      style: successStyle,
      duration: 3000,
      position: 'top-right',
    });
  };

  const showError = (message) => {
    toast.error(message, {
      style: errorStyle,
      duration: 3000,
      position: 'top-right',
    });
  };

  const showInfo = (message) => {
    toast(message, {
      style: infoStyle,
      duration: 3000,
      position: 'top-right',
    });
  };

  return { showSuccess, showError, showInfo };
};

export default useToast;
