import api from './axios'
import toast from 'react-hot-toast'

export async function downloadPdf(path, name) {
  try {
    const { data } = await api.get(path, { responseType: 'blob' })
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url; a.download = name; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch { toast.error('Téléchargement impossible. Vérifiez vos droits et réessayez.') }
}
