import { getDiretorio } from "../diretorios/diretorio.js";

let userState = {
    pathAtual: "/"
};

export default function cd(args) {
  if (args.length === 0) {
    return "Use: cd <diretório>";
  }
  const target = args[0];
  const diretorios = getDiretorio();


  if (target === "..") {
    if (userState.pathAtual !== "/") {
      userState.pathAtual = userState.pathAtual.substring(0, userState.pathAtual.lastIndexOf("/")) || "/";
    }
    return `${userState.pathAtual}`;
  }

  const newPath = userState.pathAtual === "/" 
    ? `/${target}`
    : `${userState.pathAtual}/${target}`;

  const exists = diretorios.find(d => d.path === newPath && d.tipo === "dir");

  if (!exists) {
    return `Diretório não encontrado`;
  }

  userState.pathAtual = newPath;
  return `${userState.pathAtual}`;
}

export function getCurrentPath() {
  return userState.pathAtual;
}

