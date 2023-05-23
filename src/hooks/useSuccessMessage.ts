import { useEffect } from "react"
import { showSuccessMessage } from "@/helpers/monday-actions"

export function useSuccessMessage(success: boolean) {
    useEffect(() => {
      if (success) {
        showSuccessMessage('Items were updated!', 3000)
      }
    }, [success])
  }