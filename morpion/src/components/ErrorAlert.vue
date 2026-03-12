<script>
export default {
    props: {
        errors: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<template>
    <div v-if="errors.length" class="error-alert">
        <ul>
            <li v-for="err in errors" :key="err">{{ err }}</li>
        </ul>
    </div>
</template>

<style scoped>
.error-alert {
    background-color: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
}

ul {
    margin: 0;
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
</style>
