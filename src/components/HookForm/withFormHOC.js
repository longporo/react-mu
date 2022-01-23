import { useForm } from "react-hook-form";
import React from "react";

export default function withFormHOC(Component) {
    function UseForm(props) {
        const form = useForm();
        return <Component form={form} {...props} />
    }
    return UseForm
}