import Swal from "sweetalert2";

export const showToast = (
  icon: "success" | "error",
  text: string,
  timer: number = 2000,
) => {
  Swal.fire({
    icon,
    text,
    toast: true,
    position: "top-end",
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
  });
};
