import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { ReactNode } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 3
};

interface BasicModalProps {
  children: ReactNode;
  open: boolean;
}

export default function BasicModal({children, open}: BasicModalProps) {
  return (
    <div>
      
      <Modal
        open={open}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
          {children}
        </Box>
      </Modal>
    </div>
  );
}