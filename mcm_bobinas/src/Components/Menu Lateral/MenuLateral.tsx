import { useRef } from "react";
import { toast } from "sonner"; // ✅ importar o sonner
import logonome from "../../assets/logonome.png";
import upload from "../../assets/Upload.png";
import "./MenuLateral.css";

export function MenuLateral() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const filename = file.name.toLowerCase();

      if (!filename.endsWith(".pdf") && !filename.endsWith(".xml")) {
        toast.error("Tipo de arquivo não permitido. Apenas PDF ou XML.");
        return;
      }

      console.log("📄 Arquivo selecionado:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error(`Erro: ${result.error || "Tipo de arquivo não permitido."}`);
          return;
        }

        console.log("✅ Upload concluído:", result);

        // ✅ Mensagem de sucesso
        toast.success(`Arquivo enviado: ${result.filename}`);

        // ✅ Se o backend retornar divergências, exibe aviso
        if (result.avisos && result.avisos.length > 0) {
          result.avisos.forEach((aviso: string) => {
            toast.warning(aviso);
          });
        }

      } catch (error) {
        console.error("❌ Erro no upload:", error);
        toast.error("Erro ao enviar o arquivo.");
      }
    }
  };

  return (
    <div className="container">
      <section className="menu-lateral-container">
        <nav className="menu-section">
          <div className="logo-section">
            <img src={logonome} alt="MCM Bobinas Logo" className="logo" />
          </div>
          <a href="/addproduto" className="menu-item">Adicionar produto</a>
          <a href="/addnotafiscal" className="menu-item">Adicionar nota fiscal</a>
          <a href="/simularpedido" className="menu-item">Simulação pedido</a>
        </nav>

        <div className="logo-section">
          <label htmlFor="file-upload">
            <img src={upload} alt="upload" className="upload" />
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf,.xml"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </section>
    </div>
  );
}
